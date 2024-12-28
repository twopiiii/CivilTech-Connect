<?php

namespace App\Http\Controllers;

use App\Models\Notifs;
use App\Models\OjtApplication;
use App\Models\OjtCompanies;
use App\Models\OjtReferral;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OjtCompaniesController extends Controller
{
    // Admin Manage Company Referrals
    public function fetchCompanyReferrals()
    {
        return response()->json(OjtReferral::all());
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,accepted,referred,denied',
        ]);

        try {
            // Fetch the referral details
            $referral = DB::table('ojt_company_referrals')
                ->where('id', $id)
                ->first();

            if (!$referral) {
                return response()->json(['success' => false, 'message' => 'Referral not found.']);
            }

            // Update the status of the referral
            DB::table('ojt_company_referrals')
                ->where('id', $id)
                ->update(['status' => $request->status]);

            $type = "referral";
            $readStatus = "unread";

            // Insert into notifs table
            DB::table('notifs')->insert([
                'student_number' => $referral->student_number,
                'student_name'   => $referral->student_name,
                'company_name'   => $referral->company_name,
                'status'         => $request->status,
                'type' => $type,
                'read_status' => $readStatus,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Status updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update status.']);
        }
    }

    public function store(Request $request)
    {
        // Log the incoming request data for tracking purposes
        Log::info('Company referral request received', [
            'student_number' => $request->studentNumber,
            'student_name' => $request->studentName,
            'student_email' => $request->student_email,
            'company_name' => $request->company_name,
            'head' => $request->head,
            'address' => $request->address,
            'email' => $request->email,
            'info' => $request->info,
        ]);

        // Validate the request data
        $request->validate([
            'student_number' => 'required|string',
            'student_name' => 'required|string',
            'studentEmail' => 'required|string',
            'company_name' => 'required|string',
            'head' => 'required|string',
            'address' => 'required|string',
            'email' => 'required|email',
            'info' => 'required|string',
        ]);

        $status = "pending";
        $submittedAt = now()->toDateString();

        try {
            // Insert the data into the database
            $company = DB::table('ojt_company_referrals')->insert([
                'student_number' => $request->student_number,
                'student_name' => $request->student_name,
                'student_email' => $request->studentEmail,
                'company_name' => $request->company_name,
                'head' => $request->head,
                'address' => $request->address,
                'email' => $request->email,
                'info' => $request->info,
                'status' => $status,
                'submitted_at' => $submittedAt,

            ]);

            // Log the successful insertion
            Log::info('Company referral saved successfully', [
                'company_name' => $request->company_name,
                'student_number' => $request->student_number
            ]);

            // Return success response
            return response()->json(['success' => true, 'message' => 'Company referral saved successfully.']);
        } catch (\Exception $e) {
            // Log any error that occurs during the process
            Log::error('Error saving company referral', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            // Return error response
            return response()->json(['success' => false, 'message' => 'An error occurred while saving the referral.']);
        }
    }

    public function deleteReferral($id)
    {
        DB::beginTransaction();

        try {
            $referral = OjtReferral::findOrFail($id);

            $referral->delete();

            DB::commit();

            return response()->json([
                'message' => 'Referral deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete Referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin Manage Company Applications
    public function fetchCompanyApplications()
    {
        $appications = OjtApplication::select('ojt_company_applications.*', 'ojt_companies.company_name')
            ->join('ojt_companies', 'ojt_companies.company_id', '=', 'ojt_company_applications.company_name')
            ->get();

        return response()->json($appications);
    }

    public function updateApplicationStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,accepted,referred,denied',
        ]);

        try {
            // Fetch the company_id from the application
            $application = DB::table('ojt_company_applications')
                ->where('id', $id)
                ->first();

            if (!$application) {
                return response()->json(['success' => false, 'message' => 'Application not found.']);
            }

            // Store the previous status
            $previousStatus = $application->status;

            // Update the status of the application
            DB::table('ojt_company_applications')
                ->where('id', $id)
                ->update(['status' => $request->status]);

            // Fetch the company_name from ojt_companies based on the company_id
            $company = DB::table('ojt_companies')
                ->where('company_id', $application->company_name) // Join on company_id
                ->first();

            if (!$company) {
                return response()->json(['success' => false, 'message' => 'Company not found.']);
            }

            // If the status is 'accepted', increment the accepted count in ojt_companies
            if ($request->status === 'accepted') {
                DB::table('ojt_companies')
                    ->where('company_id', $application->company_name) // Match the company_id
                    ->increment('accepted', 1); // Increment the accepted column by 1
            }

            // If the status was changed from 'accepted' to 'pending', 'denied', or 'referred', decrement the accepted count
            if (in_array($previousStatus, ['accepted']) && in_array($request->status, ['pending', 'denied', 'referred'])) {
                Log::info('Decrementing accepted count for company_id: ' . $application->company_name);
                DB::table('ojt_companies')
                    ->where('company_id', $application->company_name) // Match the company_id
                    ->decrement('accepted', 1); // Decrement the accepted column by 1
            }

            $type = "application";
            $readStatus = "unread";


            // Insert into notifs table
            DB::table('notifs')->insert([
                'student_number' => $application->student_number,
                'student_name'   => $application->student_name,
                'company_name'   => $company->company_name,
                'status'         => $request->status,
                'type' => $type,
                'read_status' => $readStatus,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Status updated successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update status.']);
        }
    }

    public function deleteApplication($id)
    {
        DB::beginTransaction();

        try {
            $referral = OjtApplication::findOrFail($id);

            $referral->delete();

            DB::commit();

            return response()->json([
                'message' => 'Application deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete Application',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // public function downloadFile($filename)
    // {
    //     $path = storage_path("storage/uploads/pdf/{$filename}");

    //     if (!file_exists($path)) {
    //         abort(404, 'File not found.');
    //     }

    //     return response()->download(
    //         $path,
    //         $filename,
    //         [
    //             'Content-Type' => 'application/pdf',
    //         ]
    //     );
    // }

    // Admin Manage OJT Companies
    public function create(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'company_name' => 'required|string',
            'company_president' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'required|string',
            'deployment_location' => 'required|string',
            'slots_available' => 'required|string',
            // 'link' => 'required|string',
            'logo' => 'nullable|image|mimes:jpg,png,jpeg,gif',
        ]);

        // Handle file upload for logo if it exists
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        // Log validated data to check if it is correct
        Log::info('Validated Data:', $validatedData);

        $maxUniqueId = OjtCompanies::max('company_id') + 1;
        $accepted = 0;

        // Save the data to the database
        try {
            $ojtCompany = OjtCompanies::create([
                'company_name' => $validatedData['company_name'],
                'company_id' => $maxUniqueId,
                'company_president' => $validatedData['company_president'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'address' => $validatedData['address'],
                'deployment_location' => $validatedData['deployment_location'],
                'slots_available' => $validatedData['slots_available'],
                'accepted' => $accepted,
                // 'link' => $validatedData['link'],
                'logo' => isset($logoPath) ? $logoPath : null,  // Save logo path if exists
            ]);

            Log::info('Ojt Company Created:', $ojtCompany->toArray());

            return response()->json([
                'message' => 'Ojt Company added successfully!',
                'ojtCompany' => $ojtCompany,
            ], 201);
        } catch (\Exception $e) {
            // Log the error if the insertion fails
            Log::error('Error inserting Ojt Company:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to add Ojt Company.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function fetch()
    {
        return response()->json(OjtCompanies::all());
    }

    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $job = OjtCompanies::findOrFail($id);

            $job->delete();

            DB::commit();

            return response()->json([
                'message' => 'Ojt Company deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete Ojt Company',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate incoming request data
            $validated = $request->validate([
                'company_name' => 'required|string',
                'company_president' => 'required|string',
                'address' => 'required|string',
                'slots_available' => 'required|string',
                'email' => 'nullable|string',
                'phone' => 'nullable|string',
                'deployment_location' => 'required|string',
                // 'link' => 'required|string',
                'logo' => 'nullable|image|mimes:jpg,png,jpeg,gif',
            ]);

            // Log the incoming request validation data
            Log::info('Ojt Company update request received', [
                'company_name' => $validated['company_name'],
                'company_president' => $validated['company_president'],
                'address' => $validated['address'],
                'slots_available' => $validated['slots_available'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'deployment_location' => $validated['deployment_location'],
                // 'link' => $validated['link'],
            ]);

            // Find the Ojt Company by ID, throw an exception if not found
            $ojtCompanies = OjtCompanies::findOrFail($id);

            // Log the found Ojt Company details before updating
            Log::info('Ojt Company found for update', [
                'job_opportunity' => $ojtCompanies
            ]);

            // Update the Ojt Company's data
            $ojtCompanies->update([
                'company_name' => $validated['company_name'],
                'company_president' => $validated['company_president'],
                'address' => $validated['address'],
                'slots_available' => $validated['slots_available'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'deployment_location' => $validated['deployment_location'],
                // 'link' => $validated['link'],
            ]);

            // Handle file upload if an image is provided
            if ($request->hasFile('logo')) {
                // Log the file upload attempt
                Log::info('Processing logo upload for Ojt Company', ['job_id' => $id]);

                // Store new image and get the file path
                $imagePath = $request->file('logo')->store('logos', 'public');

                // Log the stored image path
                Log::info('Logo uploaded successfully', ['image_path' => $imagePath]);

                // Delete the previous image if it exists
                if ($ojtCompanies->logo) {
                    Storage::disk('public')->delete($ojtCompanies->logo);
                    // Log the deletion of the old image
                    Log::info('Previous logo image deleted', ['old_logo' => $ojtCompanies->logo]);
                }

                // Update the Ojt Company's image path
                $ojtCompanies->logo = $imagePath;
            }

            // Save the updated Ojt Company information
            $ojtCompanies->save();

            // Return a successful response with the updated Ojt Company data
            return response()->json([
                'message' => 'Ojt Company updated successfully',
                'data' => $ojtCompanies
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log the error when Ojt Company is not found
            Log::error('Ojt Company not found', [
                'id' => $id,
                'error_message' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Ojt Company not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log the validation errors
            Log::error('Validation failed during Ojt Company update', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log other general errors
            Log::error('Error updating Ojt Company', [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An error occurred while updating the Ojt Company'], 500);
        }
    }

    public function updateSlots(Request $request, $id)
    {
        try {
            // Validate the incoming data
            $validated = $request->validate([
                'slots_available' => 'required|integer|min:0',
            ]);

            // Set accepted to 0 when updating slots_available
            $updateAccepted = 0;

            // Find the company or throw an exception if not found
            $company = OjtCompanies::findOrFail($id);
            $company->slots_available = $validated['slots_available'];
            $company->accepted = $updateAccepted;
            $company->save();

            // Return a successful response
            return response()->json([
                'message' => 'Slots updated successfully',
                'slots_available' => $company->slots_available,
                'accepted' => $company->accepted
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case when company is not found
            return response()->json(['message' => 'Company not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Catch any other exceptions
            return response()->json([
                'message' => 'An error occurred while updating slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // In User
    public function fetchInUser()
    {
        return response()->json(OjtCompanies::all());
    }

    public function apply(Request $request)
    {
        // Log the incoming request data for tracking purposes
        Log::info('Company application request received', [
            'company_name' => $request->company_name,
            'company_president' => $request->company_president,
            'company_address' => $request->company_address,
            'company_email' => $request->company_email,
            'company_phone' => $request->company_phone,
            'deployment_location' => $request->deployment_location,
            'student_number' => $request->student_number,
            'student_name' => $request->student_name,
            'student_email' => $request->student_email,
            'course' => $request->course,
            'year_level' => $request->year_level,
            // 'cover_letter' => $request->cover_letter,
        ]);

        // Validate the request data
        $request->validate([
            'company_name' => 'required|string',
            'company_president' => 'required|string',
            'company_address' => 'required|string',
            'company_email' => 'nullable|string',
            'company_phone' => 'nullable|string',
            'deployment_location' => 'required|string',
            'student_number' => 'required|string',
            'student_name' => 'required|string',
            'student_email' => 'required|string',
            'course' => 'required|string',
            'year_level' => 'required|string',
            // 'cover_letter' => 'nullable|string',
            // 'cv' => 'nullable|file|mimes:pdf|max:2048', // Validate the PDF file
        ]);

        $status = "pending";
        $submittedAt = now()->toDateString();

        try {
            // $fileName = null; // Default null if no file is uploaded

            // Handle file upload with the original name
            // if ($request->hasFile('cv')) {
            //     $file = $request->file('cv');
            //     $originalName = $file->getClientOriginalName();
            //     $uniqueName = time() . '_' . $originalName;
            //     $file->storeAs('uploads/pdf', $uniqueName, 'public');
            //     $fileName = $uniqueName;
            // }


            // Insert the data into the database
            DB::table('ojt_company_applications')->insert([
                'company_name' => $request->company_name,
                'company_president' => $request->company_president,
                'company_address' => $request->company_address,
                'company_email' => $request->company_email,
                'company_phone' => $request->company_phone,
                'deployment_location' => $request->deployment_location,
                'student_number' => $request->student_number,
                'student_name' => $request->student_name,
                'student_email' => $request->student_email,
                'course' => $request->course,
                'year_level' => $request->year_level,
                // 'cover_letter' => $request->cover_letter,
                // 'cv' => $fileName, // Save the file path in the database
                'status' => $status,
                'submitted_at' => $submittedAt,
            ]);

            // Log the successful insertion
            Log::info('Company application successful', [
                'company_name' => $request->company_name,
                'student_number' => $request->student_number,
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Company application successful.',
            ]);
        } catch (\Exception $e) {
            // Log any error that occurs during the process
            Log::error('Error saving company application', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while applying.',
            ]);
        }
    }

    public function getStudentApplicationStatus(Request $request)
    {
        $studentNumber = $request->input('student_number');

        $applications = OjtApplication::where('student_number', $studentNumber)->get();

        // Check if any application has 'accepted' status
        $isAccepted = $applications->some(function ($application) {
            return in_array(trim($application->status), ['accepted', 'pending', 'referred']);
        });
        return response()->json([
            'applications' => $applications,
            'isAccepted' => $isAccepted,  // Add this flag
        ], 200);
    }
}

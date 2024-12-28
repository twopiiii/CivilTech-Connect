<?php

namespace App\Http\Controllers;

use App\Models\JobOpportunities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobOpportunitiesController extends Controller
{
    public function create(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'company_name' => 'required|string',
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'required|string',
            'job_offers' => 'nullable|string',
            'company_description' => 'nullable|string',
            'link' => 'required|string',
            'logo' => 'nullable|image|mimes:jpg,png,jpeg,gif',
        ]);

        // Handle file upload for logo if it exists
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
        }

        // Log validated data to check if it is correct
        Log::info('Validated Data:', $validatedData);

        // Save the data to the database
        try {
            $jobOpportunity = JobOpportunities::create([
                'company_name' => $validatedData['company_name'],
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'address' => $validatedData['address'],
                'company_description' => $validatedData['company_description'],
                'job_offers' => $validatedData['job_offers'],
                'link' => $validatedData['link'],
                'logo' => isset($logoPath) ? $logoPath : null,  // Save logo path if exists
            ]);

            Log::info('Job Opportunity Created:', $jobOpportunity->toArray());

            return response()->json([
                'message' => 'Job opportunity added successfully!',
                'jobOpportunity' => $jobOpportunity,
            ], 201);
        } catch (\Exception $e) {
            // Log the error if the insertion fails
            Log::error('Error inserting job opportunity:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Failed to add job opportunity.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function fetch()
    {
        return response()->json(JobOpportunities::all());
    }

    public function fetchInUser()
    {
        return response()->json(JobOpportunities::all());
    }

    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $job = JobOpportunities::findOrFail($id);

            $job->delete();

            DB::commit();

            return response()->json([
                'message' => 'Job Opportunity deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete Job Opportunity',
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
                'email' => 'nullable|string',
                'phone' => 'nullable|string',
                'address' => 'required|string',
                'company_description' => 'required|string',
                'job_offers' => 'nullable|string',
                'link' => 'required|string',
                'logo' => 'nullable|image|mimes:jpg,png,jpeg,gif',
            ]);

            // Log the incoming request validation data
            Log::info('Job opportunity update request received', [
                'id' => $id,
                'company_name' => $validated['company_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'company_description' => $validated['company_description'],
                'job_offers' => $validated['job_offers'],
                'link' => $validated['link'],
            ]);

            // Find the job opportunity by ID, throw an exception if not found
            $jobOpportunity = JobOpportunities::findOrFail($id);

            // Log the found job opportunity details before updating
            Log::info('Job opportunity found for update', [
                'job_opportunity' => $jobOpportunity
            ]);

            // Update the job opportunity's data
            $jobOpportunity->update([
                'company_name' => $validated['company_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'job_offers' => $validated['job_offers'],
                'company_description' => $validated['company_description'],
                'link' => $validated['link'],
            ]);

            // Handle file upload if an image is provided
            if ($request->hasFile('logo')) {
                // Log the file upload attempt
                Log::info('Processing logo upload for job opportunity', ['job_id' => $id]);

                // Store new image and get the file path
                $imagePath = $request->file('logo')->store('logos', 'public');

                // Log the stored image path
                Log::info('Logo uploaded successfully', ['image_path' => $imagePath]);

                // Delete the previous image if it exists
                if ($jobOpportunity->logo) {
                    Storage::disk('public')->delete($jobOpportunity->logo);
                    // Log the deletion of the old image
                    Log::info('Previous logo image deleted', ['old_logo' => $jobOpportunity->logo]);
                }

                // Update the job opportunity's image path
                $jobOpportunity->logo = $imagePath;
            }

            // Save the updated job opportunity information
            $jobOpportunity->save();

            // Return a successful response with the updated job opportunity data
            return response()->json([
                'message' => 'Job opportunity updated successfully',
                'data' => $jobOpportunity
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Log the error when job opportunity is not found
            Log::error('Job Opportunity not found', [
                'id' => $id,
                'error_message' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Job Opportunity not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Log the validation errors
            Log::error('Validation failed during job opportunity update', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log other general errors
            Log::error('Error updating job opportunity', [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An error occurred while updating the job opportunity'], 500);
        }
    }
}

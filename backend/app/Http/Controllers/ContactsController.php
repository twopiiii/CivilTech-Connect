<?php

namespace App\Http\Controllers;

use App\Models\Contacts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMail;
use Illuminate\Validation\ValidationException;


class ContactsController extends Controller
{
    public function fetch()
    {
        $contacts = Contacts::all();
        return response()->json($contacts);
    }

    public function fetchForUser()
    {
        return response()->json(Contacts::all());
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create method called with data: ', $request->all());

            $validated = $request->validate([
                'media' => 'required|string|max:255',
                'info' => 'required|string|max:255',
            ]);

            // Log validated data
            Log::info('Validated data: ', $validated);

            $contact = Contacts::create([
                'media' => $validated['media'],
                'info' => $validated['info'],
            ]);

            return response()->json([
                'contact' => [
                    'id' => $contact->id,
                    'media' => $contact->media,
                    'info' => $contact->info,
                ],
                'message' => 'Category created successfully'
            ], 201);
        } catch (ValidationException $e) {
            Log::error('Validation failed: ', [
                'errors' => $e->errors(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('An error occurred while creating the contact: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the contact',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        // Begin a database transaction
        DB::beginTransaction();
        try {
            // Find the contact by ID, or throw an exception if not found
            $contact = Contacts::findOrFail($id);

            // Delete the contact
            $contact->delete();

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Contact deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            // Rollback the transaction if there is an error
            DB::rollback();
            return response()->json([
                'message' => 'Failed to delete contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Update method called with ID: ' . $id);

        // Validate the incoming request
        $validated = $request->validate([
            'info' => 'required|string|max:255',
        ]);

        try {
            // Find the contact by ID
            $contact = Contacts::findOrFail($id);

            // Update the contact's information
            $contact->info = $validated['info'];
            $contact->save(); // Save the updated contact

            return response()->json([
                'message' => 'Contact updated successfully',
                'contact' => $contact, // Return the updated contact
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating contact: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update contact'], 500);
        }
    }

    public function sendEmail(Request $request)
    {
        Log::info('Email send request received', $request->all());

        try {
            $studentNumber = $request->input('studentNumber');
            $studentName = $request->input('studentName');
            $email = $request->input('email');
            $subject = $request->input('subject');
            $messageContent = $request->input('message');

            $adminEmail = "code.besaytejomarkristoffer@gmail.com";

            // Prepare the plain-text message content
            $message = "Contact Form Submission\n\n";
            $message .= "Full Name: {$studentName}\n";
            $message .= "Student Number: {$studentNumber}\n";
            $message .= "Email: {$email}\n\n\n";
            $message .= "{$messageContent}";

            // Send the email using raw email content
            Mail::raw($message, function ($message) use ($adminEmail, $subject) {
                $message->to($adminEmail)  // Send to admin email
                    ->subject($subject);  // Set the subject
            });

            // Return success response
            return response()->json(['success' => true, 'message' => 'Email sent successfully!']);
        } catch (\Exception $e) {
            // Log error and return failure response
            Log::error('Email sending failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to send email.']);
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\StudentAccounts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentAccountController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'student_number' => 'required|string',
            'password' => 'required|string',
        ]);

        $student = StudentAccounts::where('student_number', $request->student_number)->first();

        if ($student && Hash::check($request->password, $student->password)) {
            return response()->json(['message' => 'Login Successful!', 'student' => $student], 200);
        } else {
            return response()->json(['message' => 'Login Failed. Invalid Credentials.'], 401);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'student_number' => 'required|string',
            'oldPassword' => 'required|string',

        ]);

        $student = DB::table('student_accounts')->where('student_number', $request->student_number)->first();

        if (!$student || !Hash::check($request->oldPassword, $student->password)) {
            return response()->json([
                'message' => 'Old password is incorrect.',
                'success' => false
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Old password verified.'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'student_number' => 'required|string',
            'newPassword' => 'required|string',
        ]);

        DB::table('student_accounts')->where('student_number', $request->student_number)->update(['password' => Hash::make($request->newPassword)]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.'
        ]);
    }

    public function verifyStudentNumber(Request $request)
    {
        // Log the incoming request for debugging
        Log::info('Received request for student number verification', [
            'student_number' => $request->student_number,
            'email' => $request->email,
        ]);

        // Validate request inputs
        $request->validate([
            'student_number' => 'required|string',
            'email' => 'required|string',
        ]);

        // Check if the student exists in the database
        $student = DB::table('student_accounts')->where('student_number', $request->student_number)->first();

        if (!$student) {
            // Log the error if the student doesn't exist
            Log::error('Student number not found in database', [
                'student_number' => $request->student_number,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Student Number doesn’t exist. Failed to send reset link.',
            ], 404);
        }

        // Generate a random token for password reset
        $token = Str::random(60);
        Log::info('Generated password reset token', ['token' => $token]);

        // Insert or update the token in the password_reset_tokens table
        try {
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email], // Fields to check for existing record
                [
                    'student_number' => $request->student_number, // Additional field to insert or update
                    'token' => $token,
                    'created_at' => Carbon::now(),
                ]
            );


            Log::info('Password reset token inserted/updated in the database', [
                'email' => $request->email,
            ]);
        } catch (\Exception $e) {
            // Log any error that occurs while updating or inserting the token
            Log::error('Failed to insert/update password reset token', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate reset link. Please try again.',
            ], 500);
        }

        // Send the reset link to the entered email
        $link = "localhost:5173/reset-password/$token";
        try {
            Mail::raw("Copy and paste the link to reset your password: {$link}", function ($message) use ($request) {
                $message->to($request->email)->subject('Password Reset Link');
            });

            Log::info('Password reset link sent to email', ['email' => $request->email]);
        } catch (\Exception $e) {
            // Log any error that occurs while sending the email
            Log::error('Failed to send password reset email', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset link to email.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student Number verified, reset link sent to email.',
        ]);
    }

    public function showResetForm($token)
    {
        Log::info('Showing reset password form for token: ' . $token); // Log when the reset form is being shown

        return view('auth.reset-password', compact('token'));
    }

    public function reset(Request $request)
    {
        Log::info('Password reset request received.', ['request' => $request->all()]);

        $request->validate([
            'password' => 'required|string',
            'token' => 'required|string',
        ]);

        Log::info('Validation successful for password reset.');

        // Log the token value being searched for
        Log::info('Searching for token in database.', ['token' => $request->token]);

        // Find the token in the database
        $tokenRecord = DB::table('password_reset_tokens')->where('token', $request->token)->first();

        // Log the result of the query
        Log::info('Token lookup result:', ['tokenRecord' => $tokenRecord]);

        if (!$tokenRecord) {
            Log::warning('Invalid token received for password reset.', ['token' => $request->token]);
            return back()->withErrors(['token' => 'Invalid token.']);
        }

        Log::info('Token found for password reset.', ['tokenRecord' => $tokenRecord]);

        // Find the student by student_number
        $student = StudentAccounts::where('student_number', $tokenRecord->student_number)->first();

        // Log the student retrieval process
        Log::info('Searching for student based on student_number.', ['student_number' => $tokenRecord->student_number]);

        if (!$student) {
            Log::warning('Student not found for password reset.', ['student_number' => $tokenRecord->student_number]);
            return back()->withErrors(['student_number' => 'Student number not found.']);
        }

        Log::info('Student found, updating password.', ['student_number' => $student->student_number]);

        // Update the student's password
        $student->password = Hash::make($request->password);
        $student->save();

        // Optionally, delete the token after use
        DB::table('password_reset_tokens')->where('token', $request->token)->delete();

        Log::info('Password reset successful, token deleted.');

        return response()->json(['success' => 'Password reset successful.']);
    }

    // public function fetchLatestStudentInfo(Request $request)
    // {
    //     $studentNumber = $request->input('student_number');

    //     // Get the latest student_list_[i] table
    //     $latestTable = DB::select("SHOW TABLES LIKE 'student_list_%'");

    //     if (empty($latestTable)) {
    //         return response()->json(['message' => 'No student_list tables found.'], 404);
    //     }

    //     // Sort and pick the highest table
    //     $latestTable = collect($latestTable)
    //         ->pluck('Tables_in_' . DB::getDatabaseName())
    //         ->sortDesc()
    //         ->first();

    //     Log::debug('Latest Table:', [$latestTable]);

    //     if (!preg_match('/^student_list_\d+$/i', $latestTable)) {
    //         return response()->json(['message' => 'Invalid table name format.'], 400);
    //     }

    //     // Fetch the student data from the latest table
    //     $studentData = DB::table($latestTable)
    //         ->where('student_number', $studentNumber)
    //         ->first();

    //     if ($studentData) {
    //         return response()->json(['data' => $studentData], 200);
    //     }

    //     return response()->json(['message' => 'Student not found in the latest table.'], 404);
    // }
}

<?php

namespace App\Http\Controllers;

use App\Models\Notifs;
use App\Models\OjtCompanies;
use Illuminate\Http\Request;

class NotifsController extends Controller
{
    public function fetch(Request $request)
    {
        $studentNumber = $request->query('student_number');

        // Assuming you have a Notification model that relates to the student_number
        $notifications = Notifs::where('student_number', $studentNumber)->get();

        return response()->json($notifications);
    }

    public function getCompaniesByIds(Request $request)
    {
        $companyIds = explode(',', $request->query('ids'));
        $companies = OjtCompanies::whereIn('company_id', $companyIds)->get();
        return response()->json($companies);
    }

    public function markAsRead(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'student_number' => 'required|string|exists:notifs,student_number',
        ]);

        try {
            // Update notifications for the given user
            Notifs::where('student_number', $request->student_number)
                ->where('read_status', 'unread') // Only update unread notifications
                ->update(['read_status' => 'read']);

            // Return a success response
            return response()->json([
                'success' => true,
                'message' => 'Notifications marked as read',
            ]);
        } catch (\Exception $e) {
            // Handle errors
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notifications',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

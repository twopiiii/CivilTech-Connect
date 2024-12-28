<?php

namespace App\Http\Controllers;

use App\Models\BasicInfo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BasicInfoController extends Controller
{
    public function fetch()
    {
        try {
            $basicInfo = BasicInfo::all();
            return response()->json($basicInfo, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching basic info', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validate the incoming request
        $request->validate([
            'description' => 'required|string|max:5000',
        ]);

        try {
            // Find the basic info entry by ID
            $basicInfo = BasicInfo::findOrFail($id);

            // Only update the description, title stays unchanged
            $basicInfo->description = $request->input('description');

            // Save the updated description
            $basicInfo->save();

            // Log the successful update
            Log::info('Basic info updated successfully', [
                'id' => $id,
                'description' => $basicInfo->description,
            ]);

            // Return the updated description as JSON
            return response()->json([
                'message' => 'Description updated successfully',
                'basicInfo' => $basicInfo,
            ], 200);
        } catch (\Exception $e) {
            // Log the error message
            Log::error('Error updating description', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            // Return an error if something goes wrong
            return response()->json([
                'message' => 'Error updating description',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

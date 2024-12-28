<?php

namespace App\Http\Controllers;

use App\Models\TesdaTrainingCenters;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TesdaTrainingCentersController extends Controller
{
    public function fetch()
    {
        return response()->json(TesdaTrainingCenters::all());
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create method called with data: ', $request->all());

            $validated = $request->validate([
                'training_center' => 'required|string',
                // 'course_id' => 'required|string',
                // 'center_id' => 'required|string',
                'email' => 'nullable|string',
                'phone' => 'nullable|string',
                'address' => 'required|string',

            ]);

            $maxUniqueId = TesdaTrainingCenters::max('center_id') + 1;

            // Log validated data
            Log::info('Validated data: ', $validated);

            $center = TesdaTrainingCenters::create([
                'training_center' => $validated['training_center'],
                'address' => $validated['address'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'center_id' => $maxUniqueId,
            ]);

            return response()->json([
                'center' => $center,
                'message' => 'TESDA Center created successfully'
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
            Log::error('An error occurred while creating the center: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the center',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $center = TesdaTrainingCenters::findOrFail($id);

            $center->delete();

            DB::commit();

            return response()->json([
                'message' => 'Training Center deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to delete Training Center',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Incoming data:', $request->all());
        // Validate incoming request data
        $validatedData = $request->validate([
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'required|string',
            'training_center' => 'required|string',

        ]);

        // Find the course by ID
        $center = TesdaTrainingCenters::find($id);

        if (!$center) {
            return response()->json(['message' => 'Training Center not found'], 404);
        }

        // Update the course details
        $center->phone = $validatedData['phone'];
        $center->email = $validatedData['email'];
        $center->training_center = $validatedData['training_center'];
        $center->address = $validatedData['address'];
        $center->save();

        return response()->json(['message' => 'Course updated successfully', 'course' => $center]);
    }
}

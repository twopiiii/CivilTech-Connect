<?php

namespace App\Http\Controllers;

use App\Models\TesdaCourses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TesdaCoursesController extends Controller
{
    public function fetch()
    {
        try {
            $courses = TesdaCourses::with('category')->get();
            return response()->json(['courses' => $courses]);
        } catch (\Exception $e) {
            Log::error('Error fetching courses: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching courses'], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            // Log request data
            Log::info('Create method called with data: ', $request->all());

            // Validate the incoming data
            $validated = $request->validate([
                'course' => 'required|string',
                'category_id' => 'required|int|exists:categories,category_id',
                'short_desc' => 'required|string',
                'training_center' => 'required|array', // Ensure it's an array
                'training_center.*' => 'exists:tesda_training_centers,center_id', // Validate each center ID
            ]);


            $maxUniqueId = TesdaCourses::max('course_id') + 1;

            $course = TesdaCourses::create([
                'course' => $validated['course'],
                'category_id' => $validated['category_id'],
                'short_desc' => $validated['short_desc'],
                'training_center' => json_encode($validated['training_center']),
                'course_id' => $maxUniqueId,
            ]);

            // Return success response
            return response()->json([
                'course' => $course->load('category'), // Eager load category (if you need it)
                'message' => 'TESDA Course created successfully',
            ], 201);
        } catch (ValidationException $e) {
            // Log validation errors
            Log::error('Validation failed: ', [
                'errors' => $e->errors(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Log general errors
            Log::error('An error occurred while creating the course: ' . $e->getMessage());

            return response()->json([
                'message' => 'An error occurred while creating the course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $course = TesdaCourses::findOrFail($id);

            $course->delete();

            DB::commit();

            return response()->json([
                'message' => 'Course deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to delete course',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Incoming data:', $request->all());

        try {
            // Validate incoming request data
            $validatedData = $request->validate([
                'course' => 'required|string',
                'category_id' => 'required|int',
                'short_desc' => 'required|string',
                'training_center' => 'required|array',  // Ensure it's validated as an array
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        // Find the course by ID
        $course = TesdaCourses::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Update the course details
        $course->course = $validatedData['course'];
        $course->category_id = $validatedData['category_id'];
        $course->short_desc = $validatedData['short_desc'];

        // Store the training centers as JSON
        $course->training_center = json_encode($validatedData['training_center']);

        $course->save();

        return response()->json(['message' => 'Course updated successfully', 'course' => $course]);
    }
}

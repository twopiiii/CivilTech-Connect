<?php

namespace App\Http\Controllers;

use App\Models\TesdaCategory;
use App\Models\TesdaCourses;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class TesdaCategoryController extends Controller
{
    public function fetch()
    {
        try {
            $categories = TesdaCategory::all(); // Fetch id and category columns
            return response()->json(['categories' => $categories]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json(['error' => 'Error fetching categories'], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create method called with data: ', $request->all());

            $validated = $request->validate([
                'category' => 'required|string|max:255',
                'description' => 'nullable|string',
            ]);

            $maxUniqueId = TesdaCategory::max('category_id') + 1;
            $maxSortId = TesdaCategory::max('sort') + 1;

            // Log validated data
            Log::info('Validated data: ', $validated);

            $category = TesdaCategory::create([
                'category' => $validated['category'],
                'description' => $validated['description'] ?? null,
                'category_id' => $maxUniqueId,
                'sort' => $maxSortId,

            ]);

            return response()->json([
                'category' => [
                    'id' => $category->id,
                    'category' => $category->category,
                    'category_id' => $category->category_id,
                    'description' => $category->description,
                    'sort' => $category->sort
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
            Log::error('An error occurred while creating the category: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $validatedData = $request->validate([
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Find the category by ID
        $category = TesdaCategory::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Update the category details
        $category->category = $validatedData['category'];
        $category->description = $validatedData['description'];
        $category->save();

        return response()->json(['message' => 'Category updated successfully', 'category' => $category]);
    }

    public function delete($id)
    {
        // Begin a database transaction
        DB::beginTransaction();
        try {
            $category = TesdaCategory::findOrFail($id);
            $categoryId = $category->category_id;

            $deletedCourse = TesdaCourses::where('category_id', $categoryId)->delete();

            // Delete the course
            $category->delete();

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Category and associated courses deleted successfully.',
                'deleted_course' => $deletedCourse,
            ], 200);
        } catch (\Exception $e) {
            // Rollback the transaction if there is an error
            DB::rollback();
            return response()->json(['message' => 'Failed to delete course and associated materials.', 'error' => $e->getMessage()], 500);
        }
    }

    // Fetch all categories
    public function indexCategories()
    {
        return response()->json(TesdaCategory::all());
    }

    // Fetch topics based on category_id
    public function indexCourses($category_id)
    {
        return response()->json(TesdaCourses::where('category_id', $category_id)->get());
    }
}

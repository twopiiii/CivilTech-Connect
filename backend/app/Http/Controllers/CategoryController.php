<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearningMaterials;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function fetch()
    {
        try {
            $categories = Category::all(); // Fetch id and category columns
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

            $maxUniqueId = Category::max('category_id') + 1;
            $maxSortId = Category::max('sort') + 1;


            // Log validated data
            Log::info('Validated data: ', $validated);

            $category = Category::create([
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
                    'sort' => $category->sort,
                    'description' => $category->description
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
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Update the category details
        $category->category = $validatedData['category'];
        $category->description = $validatedData['description'];
        $category->save();

        return response()->json(['message' => 'Category updated successfully', 'category' => $category]);
    }

    public function updateSortOrder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|integer|exists:categories,id',
            'categories.*.sort_id' => 'required|integer',
        ]);

        foreach ($request->categories as $categoryData) {
            $category = Category::findOrFail($categoryData['id']);
            $category->sort_id = $categoryData['sort_id'];
            $category->save();
        }

        return response()->json(['message' => 'Sort order updated successfully']);
    }


    public function delete($id)
    {
        // Begin a database transaction
        DB::beginTransaction();
        try {
            $category = Category::findOrFail($id);
            $categoryId = $category->category_id;

            $deletedTopic = Topic::where('category_id', $categoryId)->delete();
            $deletedLearningMaterials = LearningMaterials::where('category_id', $categoryId)->delete();

            // Delete the topic
            $category->delete();

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Category and associated topic and learning materials deleted successfully.',
                'deleted_topic' => $deletedTopic,
                'deleted_learning_materials' => $deletedLearningMaterials,
            ], 200);
        } catch (\Exception $e) {
            // Rollback the transaction if there is an error
            DB::rollback();
            return response()->json(['message' => 'Failed to delete topic and associated materials.', 'error' => $e->getMessage()], 500);
        }
    }
}

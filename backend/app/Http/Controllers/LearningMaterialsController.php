<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearningMaterials;
use App\Models\Topic;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class LearningMaterialsController extends Controller
{
    public function fetch()
    {
        try {
            // Fetch all categories
            $learningMaterials = LearningMaterials::with(['topic', 'category'])->get();

            return response()->json([
                'learningMaterials' => $learningMaterials
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function view($id)
    {
        try {
            // Fetch the learning material by ID with associated topic and category
            $learningMaterial = LearningMaterials::with(['topic', 'category'])->find($id);

            if (!$learningMaterial) {
                return response()->json([
                    'message' => 'Learning material not found',
                ], 404);
            }

            return response()->json([
                'learningMaterial' => [
                    'id' => $learningMaterial->id,
                    'title' => $learningMaterial->title,
                    'link' => $learningMaterial->link,
                    'description' => $learningMaterial->description,
                    'topic' => $learningMaterial->topic->topic ?? null,
                    'category' => $learningMaterial->category->category ?? null,
                    'topic_id' => $learningMaterial->topic_id,
                    'category_id' => $learningMaterial->category_id,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching the learning material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create method called with data: ', $request->all());

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'link' => 'required|string|max:2500',
                'category_id' => 'required|integer',
                'topic_id' => 'required|integer',
                'description' => 'nullable|string|max:2500',
            ]);

            // Log validated data
            Log::info('Validated data: ', $validated);

            $learningMaterials = LearningMaterials::create([
                'title' => $validated['title'],
                'link' => $validated['link'],
                'category_id' => $validated['category_id'],
                'topic_id' => $validated['topic_id'],
                'description' => $validated['description'],
            ]);

            // automatically fetches because of relationship integrated in Model
            $topic = $learningMaterials->topic;
            $category = $learningMaterials->category;

            return response()->json([
                'learningMaterial' => [
                    'id' => $learningMaterials->id,
                    'title' => $learningMaterials->title,
                    'topic_id' => $learningMaterials->topic_id,
                    'topic' => $topic->topic,
                    'category_id' => $learningMaterials->category_id,
                    'category' => $category->category,
                    'link' => $learningMaterials->link,
                    'description' => $learningMaterials->description,
                ],
                'message' => 'Learning Material added successfully'
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
            Log::error('An error occurred while adding the learning material: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while adding the learning material',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'link' => 'required|string|max:2500',
            'category_id' => 'required|integer',
            'topic_id' => 'required|integer',
            'description' => 'nullable|string|max:2500',
        ]);

        // Find the material by ID
        $material = LearningMaterials::findOrFail($id);

        // Update the material with the new data
        $material->update($validatedData);
        $material->save();

        // Return a success response
        return response()->json(['message' => 'Material updated successfully'], 200);
    }


    public function delete($id)
    {
        $learningMaterial = LearningMaterials::find($id);

        if (!$learningMaterial) {
            return response()->json([
                'message' => 'Learning material not found',
            ], 404);
        }

        try {
            $learningMaterial->delete();

            return response()->json([
                'message' => 'Learning material deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error occurred while deleting the learning material',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Fetch all categories
    public function indexCategories()
    {
        return response()->json(Category::all());
    }

    // Fetch topics based on category_id
    public function indexTopics($categoryId)
    {
        return response()->json(Topic::where('category_id', $categoryId)->get());
    }

    // Fetch learning materials based on topic_id and category_id
    public function indexLearningMaterials($topicId)
    {
        return response()->json(LearningMaterials::where('topic_id', $topicId)->get());
    }
}

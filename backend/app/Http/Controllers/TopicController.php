<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\LearningMaterials;
use App\Models\Topic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class TopicController extends Controller
{

    public function fetch()
    {
        try {
            // Fetch all topics with their related categories
            $topics = Topic::with('category')->get(); // Make sure the relationship is defined in the Topic model

            // Fetch all categories
            $categories = Category::all();

            // Return response with categories and topics
            return response()->json([
                'categories' => $categories,
                'topics' => $topics,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create topic called with data: ', $request->all());

            $validated = $request->validate([
                'topic' => 'required|string|max:255',
                'category_id' => 'required|integer',
            ]);

            $maxTopicId = Topic::max('topic_id') + 1;
            // Log validated data
            Log::info('Validated data: ', $validated);

            // Save the topic with the category name
            $topic = Topic::create([
                'topic' => $validated['topic'],
                'topic_id' => $maxTopicId,
                'category_id' => $validated['category_id']
            ]);

            // Find the category name
            $category = Category::where('category_id', $topic->category_id)->first();

            if (!$category) {
                return response()->json([
                    'message' => 'Category not found.',
                ], 404);
            }

            return response()->json([
                'topic' => [
                    'id' => $topic->id,
                    'topic' => $topic->topic,
                    'topic_id' => $topic->topic_id,
                    'category' => $category->category,
                    'category_id' => $topic->category_id,
                ],
                'message' => 'Topic created successfully.',
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
            Log::error('An error occurred while creating the topic: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while creating the topic',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate the request
            $validatedData = $request->validate([
                'topic' => 'required|string|max:255',
                'category_id' => 'required|integer|exists:categories,category_id',
            ]);

            // Find the topic
            $topic = Topic::find($id);

            if (!$topic) {
                Log::error('Topic not found', ['topic_id' => $id]);
                return response()->json(['message' => 'Topic not found'], 404);
            }

            // Update the topic details
            $topic->topic = $validatedData['topic'];
            $topic->category_id = $validatedData['category_id'];
            $topic->save();

            Log::info('Topic updated successfully', ['topic' => $topic]);

            return response()->json(['message' => 'Topic updated successfully', 'topic' => $topic]);
        } catch (\Exception $e) {
            Log::error('Error updating topic', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'An error occurred while updating the topic'], 500);
        }
    }

    public function delete($id)
    {
        // Begin a database transaction
        DB::beginTransaction();
        try {
            // Find the topic by ID
            $topic = Topic::findOrFail($id);
            $topicId = $topic->topic_id; // Assuming 'topic' is the column holding the name

            // Delete associated learning materials where topic matches the topic name
            $deletedCount = LearningMaterials::where('topic_id', $topicId)->delete(); // Ensure 'topic' matches your column name

            // Delete the topic
            $topic->delete();

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Topic and associated learning materials deleted successfully.',
                'deleted_learning_materials' => $deletedCount,
            ], 200);
        } catch (\Exception $e) {
            // Rollback the transaction if there is an error
            DB::rollback();
            return response()->json(['message' => 'Failed to delete topic and associated materials.', 'error' => $e->getMessage()], 500);
        }
    }
}

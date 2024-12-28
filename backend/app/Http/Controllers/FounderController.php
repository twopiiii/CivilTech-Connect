<?php

namespace App\Http\Controllers;

use App\Models\Founder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FounderController extends Controller
{
    public function fetch()
    {
        return response()->json(Founder::all());
    }

    public function fetchForUser()
    {
        return response()->json(Founder::all());
    }

    public function update(Request $request, $id)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'img' => 'nullable|file|mimes:jpg,png,jpeg|max:2048', // Validate image file
        ]);

        try {
            // Log the incoming request
            Log::info('Updating founder', ['id' => $id, 'name' => $validated['name']]);

            // Find the founder by ID, throw an exception if not found
            $founder = Founder::findOrFail($id);

            // Update the founder's name
            $founder->name = $validated['name'];

            // Handle file upload if an image is provided
            if ($request->hasFile('img')) {
                // Store new image and get the file path
                $imagePath = $request->file('img')->store('founder', 'public');

                // Delete the previous image if it exists
                if ($founder->img) {
                    Storage::disk('public')->delete($founder->img);
                }

                // Update the founder's image path
                $founder->img = $imagePath;
            }

            // Save the updated founder information
            $founder->save();

            // Return a successful response with the updated founder data
            return response()->json($founder, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Founder not found', ['id' => $id]);
            return response()->json(['message' => 'Founder not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating founder', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'An error occurred while updating the founder'], 500);
        }
    }
}

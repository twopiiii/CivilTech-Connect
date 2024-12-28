<?php

namespace App\Http\Controllers;

use App\Models\Socials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SocialsController extends Controller
{
    public function fetch()
    {
        $socials = Socials::all();
        return response()->json($socials);
    }

    public function fetchForUser()
    {
        return response()->json(Socials::all());
    }

    public function create(Request $request)
    {
        try {
            Log::info('Create method called with data: ', $request->all());

            $validated = $request->validate([
                'social_media' => 'required|string|max:255',
                'link' => 'required|string|max:255',
            ]);

            Log::info('Validated data: ', $validated);

            $socials = Socials::create([
                'social_media' => $validated['social_media'],
                'link' => $validated['link'],
            ]);

            return response()->json([
                'socials' => [
                    'id' => $socials->id,
                    'social_media' => $socials->social_media,
                    'link' => $socials->link,
                ],
                'message' => 'Social Media Link created successfully'
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
            Log::error('An error occured while creating the contact: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occured while creating the contact',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();

        try {
            $socials = Socials::findOrFail($id);

            $socials->delete();

            DB::commit();

            return response()->json([
                'message' => 'Social Media Link deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to delete Social Media Link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        Log::info('Update method called with ID: ' . $id);

        $validated = $request->validate([
            'link' => 'required|string|max:255',
        ]);

        try {
            $socials = Socials::findOrFail($id);

            $socials->link = $validated['link'];
            $socials->save();

            return response()->json([
                'message' => 'Social Media Link updated successfully',
                'socials' => $socials,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating social media link: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to updated Social Media Link'], 500);
        }
    }
}

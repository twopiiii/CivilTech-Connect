<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthenticationController extends Controller
{
    public function authenticate(Request $request)
    {
        //Apply Validation

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            // 'username' => 'required|username',
            // 'studentID' => 'required|studentID',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ]);
        } else {
            $credentials = [
                'email' => $request->email,
                'password' => $request->password,
                // 'username' => $request->username,
                // 'studentID' => $request->studentID,

            ];

            if (Auth::attempt($credentials)) {

                $user = User::find(Auth::user()->id);

                $token = $user->createToken('token')->plainTextToken;

                return response()->json([
                    'status' => true,
                    'token' => $token,
                    'id' => Auth::user()->id,
                ]);
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Either email/password is incorrect'
                ]);
            }
        }
    }

    public function logout()
    {
        $user = User::find(Auth::user()->id);
        $user->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout Success'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'newPassword' => 'required|string',
        ]);

        Log::info('Request received for password change:', $request->all());

        try {
            // Verify the user exists
            $userExists = DB::table('users')->where('id', $request->id)->exists();
            Log::info('User exists: ' . ($userExists ? 'Yes' : 'No'));

            if (!$userExists) {
                return response()->json(['success' => false, 'message' => 'Id not found.'], 404);
            }

            // Update password
            $updated = DB::table('users')
                ->where('id', $request->id)
                ->update(['password' => Hash::make($request->newPassword)]);

            Log::info('Number of rows updated: ' . $updated);

            if ($updated) {
                return response()->json(['success' => true, 'message' => 'Password changed successfully.']);
            } else {
                return response()->json(['success' => false, 'message' => 'Password update failed.'], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error during password change:', ['error' => $e->getMessage()]);

            return response()->json(['success' => false, 'message' => 'An error occurred.'], 500);
        }
    }
}

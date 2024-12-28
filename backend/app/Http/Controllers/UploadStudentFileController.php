<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
use App\Models\StudentList;
use App\Models\UploadStudentFile;
use Illuminate\Support\Facades\Hash;

class UploadStudentFileController extends Controller
{
    public function fetchFiles()
    {
        return response()->json(UploadStudentFile::all());
    }

    // Method to fetch students based on selected file's table name
    public function fetchStudents(Request $request)
    {
        $fileId = $request->input('file_id');

        // Find the uploaded file entry by database and get the associated table name
        $file = UploadStudentFile::find($fileId);

        if (!$file) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Use the table name from the uploaded_files table to set the table for Student model
        $studentTable = $file->database;
        $students = (new StudentList())->setTable($studentTable)->get();

        return response()->json($students);
    }

    public function uploadStudentFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:2048', // Validate file type and size
        ]);

        if ($request->hasFile('file')) {
            try {
                Log::info('File received for upload.');

                $file = $request->file('file');
                $filePath = $file->store('public/uploads');

                Log::info("File stored at {$filePath}");

                $spreadsheet = IOFactory::load($file->getPathname());
                $sheet = $spreadsheet->getActiveSheet();

                // Determine the new table name
                $latestTable = DB::table('uploaded_student_files')->max('id') + 1;
                $tableName = 'student_list_' . $latestTable;

                Log::info("New table name will be: {$tableName}");

                // Create a new table
                Schema::create($tableName, function (Blueprint $table) {
                    $table->id();
                    $table->string('student_number')->unique();
                    $table->string('full_name');
                    $table->string('year_level');
                    $table->string('course');
                    $table->string('enrolled_units');
                    $table->string('age');
                    $table->string('address');
                    $table->string('birthday');
                });

                Log::info("Table {$tableName} created successfully.");

                // Initialize the StudentList model and set the dynamic table name
                $studentList = new StudentList();
                $studentList->setTable($tableName); // Set the correct table name here

                $studentNumbers = [];  // To keep track of all processed student numbers

                // Process each row, starting from the second row (skipping the header)
                foreach ($sheet->getRowIterator(2) as $row) {
                    $cellIterator = $row->getCellIterator();
                    $cellIterator->setIterateOnlyExistingCells(false);

                    $data = [];
                    foreach ($cellIterator as $cell) {
                        $data[] = $cell->getValue();
                    }

                    // Check if the row contains only null values (or empty cells)
                    if (array_filter($data) === []) {
                        break; // Stop processing if the row is empty or null
                    }

                    // Add the student number to the list
                    $studentNumbers[] = $data[0];

                    // Insert the row data into the dynamically set table
                    $studentList->create([
                        'student_number' => $data[0],
                        'full_name' => $data[1],
                        'year_level' => $data[2],
                        'course' => $data[3],
                        'enrolled_units' => $data[4],
                        'age' => $data[5],
                        'address' => $data[6],
                        'birthday' => $data[7],
                    ]);

                    // If student_number is existing in student_accounts table, skip entry.
                    $existingStudent = DB::table('student_accounts')->where('student_number', $data[0])->exists();

                    if (!$existingStudent) {
                        // Insert new student record if not exists
                        DB::table('student_accounts')->insert([
                            'student_number' => $data[0],
                            'full_name' => $data[1],
                            'year_level' => $data[2],
                            'course' => $data[3],
                            'password' => Hash::make($data[0]),
                        ]);
                    } else {
                        // Update existing student record with latest year_level and course
                        DB::table('student_accounts')->where('student_number', $data[0])->update([
                            'full_name' => $data[1],    // Update name if needed
                            'year_level' => $data[2],   // Update year_level
                            'course' => $data[3],       // Update course
                        ]);

                        Log::info("Updated student_number {$data[0]} with new year_level and course.");
                    }
                }

                Log::info("Data inserted successfully into {$tableName}");

                // Cleanup: Remove students from student_accounts not in the uploaded file
                DB::table('student_accounts')->whereNotIn('student_number', $studentNumbers)->delete();
                Log::info("Cleanup completed: Removed students not in the uploaded file.");

                // Save the file record in the uploaded_student_files table
                $fileRecordId = DB::table('uploaded_student_files')->insert([
                    'filename' => $file->getClientOriginalName(),
                    'database' => $tableName,
                    'created_at' => now()
                ]);

                Log::info("File record added to uploaded_student_files table.");

                return response()->json([
                    'message' => 'File uploaded and processed successfully',
                    'id' => $fileRecordId,
                    'filename' => $file->getClientOriginalName(),
                    'database' => $tableName
                ], 200);
            } catch (\Exception $e) {
                Log::error("Error processing file upload: " . $e->getMessage());
                return response()->json(['message' => 'An error occurred while processing the file.', 'error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function deleteFiles(Request $request)
    {
        $fileIds = $request->input('fileIds');

        // Validate the input
        $request->validate([
            'fileIds' => 'required|array',
            'fileIds.*' => 'exists:uploaded_student_files,id', // Ensure file IDs exist
        ]);

        foreach ($fileIds as $fileId) {
            // Get the file information
            $file = UploadStudentFile::find($fileId);
            if ($file) {
                // Delete the corresponding database table
                Schema::dropIfExists($file->database); // Assumes 'database' is the name of the table

                // Delete the file record from the uploaded_student_files table
                $file->delete();
            }
        }

        return response()->json(['message' => 'Files deleted successfully.']);
    }
}

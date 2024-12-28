<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UploadStudentFile extends Model
{
    use HasFactory;

    protected $table = "uploaded_student_files";
    public $timestamps = false;

    protected $fillable = ['filename', 'database'];
}

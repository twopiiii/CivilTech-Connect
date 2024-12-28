<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAccounts extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $table = 'student_accounts';
    protected $fillable = ['student_number', 'full_name', 'password', 'year_level', 'course'];
}

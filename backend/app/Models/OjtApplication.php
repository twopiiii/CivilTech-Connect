<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OjtApplication extends Model
{
    use HasFactory;

    protected $table = "ojt_company_applications";
    protected $fillable = [
        'company_name',
        'company_president',
        'company_address',
        'company_email',
        'company_phone',
        'deployment_location',
        'student_number',
        'student_name',
        'student_email',
        'cv',
        'course',
        'year_level',
        // 'cover_letter',
        'status',
        'submitted_at',
    ];
    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OjtReferral extends Model
{
    use HasFactory;

    protected $table = "ojt_company_referrals";
    protected $fillable = [
        'student_number',
        'student_email',
        'company_name',
        'head',
        'address',
        'email',
        'info',
        'status',
        'submitted_at',
    ];
    public $timestamps = false;
}

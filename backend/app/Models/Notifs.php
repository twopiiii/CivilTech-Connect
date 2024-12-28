<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifs extends Model
{
    use HasFactory;

    protected $table = "notifs";
    protected $fillable = ['student_number', 'student_name', 'company_name', 'status', 'type', 'read_status'];
    public $timestamps = true;
}

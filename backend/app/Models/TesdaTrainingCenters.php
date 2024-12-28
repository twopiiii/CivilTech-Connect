<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TesdaTrainingCenters extends Model
{
    use HasFactory;

    protected $table = "tesda_training_centers";
    public $timestamps = false;

    protected $fillable = ['training_center', 'center_id', 'address', 'email', 'phone'];

    // Define the relationship with courses
    public function courses()
    {
        return $this->belongsToMany(TesdaCourses::class, 'training_center', 'center_id', 'course_id');
    }
}

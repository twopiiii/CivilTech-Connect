<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TesdaCourses extends Model
{
    use HasFactory;

    protected $table = "tesda_courses";
    public $timestamps = false;


    protected $fillable = [
        'course',
        'category_id',
        'short_desc',
        'training_center',
        'course_id',
    ];

    public function category()
    {
        return $this->belongsTo(TesdaCategory::class, 'category_id');
    }

    // If you want to return the training centers, you might need a relationship here
    public function trainingCenters()
    {
        return $this->belongsToMany(TesdaTrainingCenters::class, 'training_center', 'course_id', 'center_id');
    }
}

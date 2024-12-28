<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory;

    protected $table = "topics";
    public $timestamps = false;


    protected $fillable = ['topic', 'topic_id', 'category', 'category_id'];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Define the relationship with the LearningMaterial model
    public function learningMaterials()
    {
        return $this->hasMany(LearningMaterials::class, 'topic_id');
    }
}

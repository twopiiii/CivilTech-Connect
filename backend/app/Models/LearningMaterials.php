<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningMaterials extends Model
{
    use HasFactory;

    protected $table = "learning_materials";
    protected $fillable = ['title', 'link', 'description', 'category_id', 'topic_id'];
    public $timestamps = false;

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id', 'topic_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}

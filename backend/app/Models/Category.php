<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;
    protected $table = "categories";
    public $timestamps = false;

    protected $fillable = ['category', 'description', 'category_id', 'sort'];

    public function topics()
    {
        return $this->hasMany(Topic::class, 'category_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TesdaCategory extends Model
{
    use HasFactory;
    protected $table = "tesda_category";
    public $timestamps = false;

    protected $fillable = ['category', 'description', 'category_id', 'sort'];

    public function courses()
    {
        return $this->hasMany(TesdaCourses::class, 'category_id');
    }
}

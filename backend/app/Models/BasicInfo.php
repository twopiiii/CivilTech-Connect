<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BasicInfo extends Model
{
    use HasFactory;

    protected $table = 'basic_info';
    protected $fillable = ['title', 'description'];
    public $timestamps = false;
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Founder extends Model
{
    use HasFactory;

    protected $table = "founders";
    protected $fillable = ['img', 'name'];
    public $timestamps = false;
}

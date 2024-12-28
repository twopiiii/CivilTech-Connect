<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Socials extends Model
{
    use HasFactory;

    protected $table = "socials";
    public $timestamps = false;

    protected $fillable = ['social_media', 'link'];
}

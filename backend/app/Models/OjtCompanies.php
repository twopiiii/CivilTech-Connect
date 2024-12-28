<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OjtCompanies extends Model
{
    use HasFactory;

    protected $table = "ojt_companies";
    protected $fillable = [
        'company_name',
        'company_id',
        'company_president',
        'email',
        'phone',
        'address',
        'deployment_location',
        'slots_available',
        'accepted',
        'link',
        'logo'
    ];
    public $timestamps = false;
}

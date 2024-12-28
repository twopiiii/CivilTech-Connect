<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobOpportunities extends Model
{
    use HasFactory;

    protected $table = "job_opportunities";
    protected $fillable = [
        'company_name',
        'email',
        'phone',
        'address',
        'job_offers',
        'link',
        // 'socmed_link',
        'company_description',
        'logo'
    ];
    public $timestamps = false;
}

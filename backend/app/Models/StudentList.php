<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentList extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = ['student_number', 'full_name', 'year_level', 'course', 'enrolled_units', 'age', 'address', 'birthday'];


    public function setTable($table)
    {
        $this->table = $table;
        return $this;
    }
}

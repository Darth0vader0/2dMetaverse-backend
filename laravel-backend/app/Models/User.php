<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Jenssegers\Mongodb\Eloquent\Model as Eloquent;


class User extends Eloquent
{
    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = ['username', 'nickname', 'password'];

    protected $hidden = ['password'];  // To hide the password when returning user data
}
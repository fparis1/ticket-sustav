<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
 
class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        DB::table('tickets')->insert([
            'name' => Str::random(10),
            'description' => Str::random(10),
            'status' => Str::random(10),
            'client_id' => 1,
            'technician_id' => 1,
        ]);
    }
}
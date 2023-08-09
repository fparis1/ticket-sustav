<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
 
class UserSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $fullNames = [
            'John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Williams', 'David Brown',
            'Sarah Wilson', 'Robert Anderson', 'Linda Martinez', 'William Taylor', 'Karen Jackson'
        ];
        
        $currentDateTime = now();
        
        for ($i = 0; $i < count($fullNames); $i++) {
            $fullName = $fullNames[$i];
            $username = strtolower(str_replace(' ', '_', $fullName));
            
            DB::table('users')->insert([
                'name' => $fullName,
                'email' => $username . '@example.com',
                'password' => bcrypt('password123'),
                'role' => 'tech',
                'created_at' => $currentDateTime,
                'email_verified_at' => $currentDateTime,
            ]);
        }
    }


}
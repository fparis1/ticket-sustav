<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
 
class TicketSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $statuses = ['open', 'taken', 'closed'];
        
        for ($i = 0; $i < 10; $i++) {
            DB::table('tickets')->insert([
                'name' => 'Create Programming Application ' . ($i + 1),
                'description' => 'Develop a programming application that...',
                'status' => $statuses[rand(0, 2)],
                'client_id' => 1,
                'technician_id' => 1,
            ]);
        }
    }
}
<?php
 
namespace Database\Seeders;
 
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
 
class ClientSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $clientData = [
            ['name' => 'Alice Johnson', 'email' => 'alice@example.com'],
            ['name' => 'Bob Smith', 'email' => 'bob@example.com'],
            ['name' => 'Charlie Williams', 'email' => 'charlie@example.com'],
            ['name' => 'Eve Brown', 'email' => 'eve@example.com'],
            ['name' => 'Frank Wilson', 'email' => 'frank@example.com'],
            ['name' => 'Grace Martinez', 'email' => 'grace@example.com'],
            ['name' => 'Henry Taylor', 'email' => 'henry@example.com'],
            ['name' => 'Isabella Anderson', 'email' => 'isabella@example.com'],
            ['name' => 'Jack Davis', 'email' => 'jack@example.com'],
            ['name' => 'Katherine Clark', 'email' => 'katherine@example.com']
        ];
        
        $currentDateTime = now();
        
        foreach ($clientData as $data) {
            $name = $data['name'];
            $emailPrefix = strtolower(str_replace(' ', '_', $name));
            $email = $emailPrefix . '@example.com';
            $phoneNumber = $this->generateActualPhoneNumber();
            
            DB::table('clients')->insert([
                'name' => $name,
                'email' => $email,
                'phone' => $phoneNumber,
                'created_at' => $currentDateTime,
            ]);
        }
    }

    private function generateActualPhoneNumber(): string
    {
        $areaCode = mt_rand(200, 999); // Random area code
        $prefix = mt_rand(200, 999);   // Random prefix
        $lineNumber = mt_rand(1000, 9999); // Random line number
        
        return $areaCode . '-' . $prefix . '-' . $lineNumber;
    }


}
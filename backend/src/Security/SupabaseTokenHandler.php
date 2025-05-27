<<<<<<<< HEAD:backend/src/Security/SupabaseTokenHandler.php
<?php
namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class SupabaseTokenHandler implements AccessTokenHandlerInterface
{
    private string $supabaseSecret;

    public function __construct(
        private UserRepository $repository,
        private EntityManagerInterface $entityManager
    ) {
        $this->supabaseSecret = 'V/up3/PietyVgYJXbfMrYOOpHPvRR2fX9e3fr+DmupbYAdNGFQtwpbfOon0QHt0/B1HEmtIEHEAC06aF7xiytg==';
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {       try {
            // Decode and validate the JWT using Supabase secret
            $decoded = JWT::decode($accessToken, new Key($this->supabaseSecret, 'HS256'));
            // Extract user information from JWT
            $supabaseId = $decoded->sub ?? null;
            $email = $decoded->email ?? null;
            
            // Extract first name and last name from user_metadata
            $firstName = $decoded->user_metadata->first_name ?? 'User';
            $lastName = $decoded->user_metadata->last_name ?? 'User';
            
            if (!$supabaseId) {
                throw new BadCredentialsException('Invalid JWT: missing sub claim');
            }

            // Try to find existing user by supabaseUserId
            $user = $this->repository->findOneBy(['supabaseUserId' => $supabaseId]);

            // If not found, try to find by email (for existing users)
            if (!$user && $email) {
                $user = $this->repository->findOneBy(['email' => $email]);
                // If found by email, link the Supabase ID and update names if needed
                if ($user) {
                    $user->setSupabaseUserId($supabaseId);
                    
                    $this->entityManager->persist($user);
                    $this->entityManager->flush();
                }
            } 
            // If still not found, create a new user          
            if (!$user) {
                if (!$email) {
                    throw new BadCredentialsException('Invalid JWT: missing email claim');
                }

                $user = new User();
                $user->setEmail($email);
                $user->setSupabaseUserId($supabaseId);
                $user->setRoles(['ROLE_USER']);
                $user->setPassword(''); 
                $user->setFirstName($firstName);
                $user->setLastName($lastName);
                
                $this->entityManager->persist($user);
                $this->entityManager->flush();
            }

            return new UserBadge($user->getUserIdentifier());
            
        } catch (\Exception $e) {
            throw new BadCredentialsException('Invalid JWT token: ' . $e->getMessage());
        }
    }
========
<?php 
// src/Security/AccessTokenHandler.php 
namespace App\Security; 
 
use App\Repository\UserRepository; 
use Symfony\Component\Security\Core\Exception\BadCredentialsException; 
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface; 
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge; 
 
class AccessTokenHandler implements AccessTokenHandlerInterface 
{ 
   public function __construct( 
       private UserRepository $repository 
   ) { 
   } 
 
   public function getUserBadgeFrom(string $accessToken): UserBadge 
   { 
       $user = $this->repository->findOneBy(["token" => $accessToken]); 
 
       if (null === $user) { 
           throw new BadCredentialsException('Invalid credentials.'); 
       } 
 
       return new UserBadge($user->getUserIdentifier()); 
   } 
>>>>>>>> master:backend/src/Security/AccessTokenHandler.php
}
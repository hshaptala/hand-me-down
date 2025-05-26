<?php
// src/Security/AccessTokenHandler.php
namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    private string $supabaseSecret;

    public function __construct(
        private UserRepository $repository,
        private EntityManagerInterface $entityManager
    ) {
        $this->supabaseSecret = 'V/up3/PietyVgYJXbfMrYOOpHPvRR2fX9e3fr+DmupbYAdNGFQtwpbfOon0QHt0/B1HEmtIEHEAC06aF7xiytg==';
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        try {
            // Decode and validate the JWT using Supabase secret
            $decoded = JWT::decode($accessToken, new Key($this->supabaseSecret, 'HS256'));
              // Extract user information from JWT claims
            $supabaseId = $decoded->sub ?? null;
            $email = $decoded->email ?? null;
            $firstName = $decoded->given_name ?? $decoded->first_name ?? 'User';
            $lastName = $decoded->family_name ?? $decoded->last_name ?? 'User';
            
            if (!$supabaseId) {
                throw new BadCredentialsException('Invalid JWT: missing sub claim');
            }

            // Try to find existing user by supabaseUserId
            $user = $this->repository->findOneBy(['supabaseUserId' => $supabaseId]);

            // If not found, try to find by email (for existing users)
            if (!$user && $email) {
                $user = $this->repository->findOneBy(['email' => $email]);
                
                // If found by email, link the Supabase ID
                if ($user) {
                    $user->setSupabaseUserId($supabaseId);
                    $this->entityManager->persist($user);
                    $this->entityManager->flush();
                }
            }            // If still not found, create a new user
            if (!$user) {
                if (!$email) {
                    throw new BadCredentialsException('Invalid JWT: missing email claim');
                }

                $user = new User();
                $user->setEmail($email);
                $user->setSupabaseUserId($supabaseId);
                $user->setRoles(['ROLE_USER']);
                // Set a placeholder password since the field is required but not used for JWT auth
                $user->setPassword(''); 
                  // Set required fields with values from JWT or defaults
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
}
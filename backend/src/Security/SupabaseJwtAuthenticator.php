<?php
// src/Security/SupabaseJwtAuthenticator.php
namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class SupabaseJwtAuthenticator extends AbstractAuthenticator
{
    private ?string $jwtSecret;

    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {
        // Get JWT secret from environment variable
        $this->jwtSecret = $_ENV['SUPABASE_JWT_SECRET'] ?? null;
        
        // If not found, log a warning
        if (!$this->jwtSecret) {
            throw new \LogicException('SUPABASE_JWT_SECRET environment variable is not set. Authentication will not work.');
        }
    }    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization') &&
            str_starts_with($request->headers->get('Authorization'), 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        try {
            $authHeader = $request->headers->get('Authorization');
            $jwt = substr($authHeader, 7); // Remove "Bearer " prefix
            
            $payload = $this->decodeJwt($jwt);
            
            // Extract user data from JWT
            $userId = $payload['sub'] ?? null;
            $email = $payload['email'] ?? null;
            $avatar = $payload['user_metadata']['avatar_url'] ?? null;
            
            if (!$userId) {
                throw new CustomUserMessageAuthenticationException('Invalid JWT token: No user ID found');
            }
            
            // Find existing user or create a new one
            $user = $this->userRepository->findOneBy(['supabaseId' => $userId]);
            
            if (!$user) {
                $user = new User();
                $user->setSupabaseId($userId);
                
                // Set email if available
                if ($email) {
                    $user->setEmail($email);
                }
                
                // Set avatar if available
                if ($avatar) {
                    $user->setAvatar($avatar);
                }
                
                // Set default role
                $user->setRoles(['ROLE_USER']);
                
                // Set a random password (as we're using Supabase for auth)
                $user->setPassword(bin2hex(random_bytes(16)));
                
                $this->em->persist($user);
                $this->em->flush();
            } else {
                // Update user information if changed
                $updated = false;
                
                if ($avatar && $user->getAvatar() !== $avatar) {
                    $user->setAvatar($avatar);
                    $updated = true;
                }
                
                if ($email && $user->getEmail() !== $email) {
                    $user->setEmail($email);
                    $updated = true;
                }
                
                if ($updated) {
                    $this->em->flush();
                }
            }
            
            return new SelfValidatingPassport(
                new UserBadge($userId, function() use ($user) { 
                    return $user; 
                })
            );
        } catch (\Exception $e) {
            throw new CustomUserMessageAuthenticationException('Authentication failed: ' . $e->getMessage());
        }
    }    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // Return null to continue with the request
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $data = [
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData())
        ];

        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    private function decodeJwt(string $jwt): array
    {
        if (empty($this->jwtSecret)) {
            throw new CustomUserMessageAuthenticationException('JWT secret is not configured');
        }
        
        try {
            $decoded = JWT::decode($jwt, new Key($this->jwtSecret, 'HS256'));
            return (array) json_decode(json_encode($decoded), true);
        } catch (\Exception $e) {
            throw new CustomUserMessageAuthenticationException('Invalid JWT: ' . $e->getMessage());
        }
    }
}

<?php
// src/Security/SupabaseJwtAuthenticator.php
namespace App\Security;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class SupabaseJwtAuthenticator extends AbstractAuthenticator
{
    private string $jwksUrl;
    private array $jwks;

    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $em
    ) {
        $this->jwksUrl = getenv('SUPABASE_JWKS_URL') ?: '';
        $this->jwks = [];
    }

    public function supports(Request $request): ?bool
    {
        return $request->headers->has('Authorization') &&
            str_starts_with($request->headers->get('Authorization'), 'Bearer ');
    }

    public function authenticate(Request $request): Passport
    {
        $authHeader = $request->headers->get('Authorization');
        $jwt = substr($authHeader, 7);
        $payload = $this->decodeJwt($jwt);
        $userId = $payload['sub'] ?? null;
        $avatar = $payload['avatar_url'] ?? null;
        if (!$userId) {
            throw new AuthenticationException('No user id in JWT');
        }
        $user = $this->userRepository->findOneBy(['supabaseId' => $userId]);
        if (!$user) {
            $user = new User();
            $user->setSupabaseId($userId);
            if ($avatar) $user->setAvatar($avatar);
            $this->em->persist($user);
            $this->em->flush();
        } else if ($avatar && $user->getAvatar() !== $avatar) {
            $user->setAvatar($avatar);
            $this->em->flush();
        }
        return new SelfValidatingPassport(new UserBadge($userId, function() use ($user) { return $user; }));
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new Response('Authentication Failed', 401);
    }

    private function decodeJwt(string $jwt): array
    {
        if (empty($this->jwks)) {
            $jwksJson = file_get_contents($this->jwksUrl);
            $this->jwks = JWK::parseKeySet(json_decode($jwksJson, true));
        }
        $jwks = $this->jwks; // assign to variable for reference
        $decoded = JWT::decode($jwt, $jwks);
        return (array) json_decode(json_encode($decoded), true);
    }
}

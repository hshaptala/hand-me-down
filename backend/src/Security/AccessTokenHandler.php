<?php

/**
 * Access token handler for API authentication.
 *
 * This file handles access token authentication for API requests.
 *
 * PHP version 8.2
 *
 * @category Security
 * @package  App\Security
 * @author   Hand-Me-Down Team <team@handmedown.com>
 * @license  MIT https://opensource.org/licenses/MIT
 * @link     https://github.com/hand-me-down/hand-me-down
 * @since    1.0.0
 */

namespace App\Security;

use App\Repository\UserRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

/**
 * Handles access token authentication for API requests.
 *
 * This class implements the AccessTokenHandlerInterface to provide
 * authentication functionality using access tokens stored in the database.
 *
 * @category Security
 * @package  App\Security
 * @author   Hand-Me-Down Team <team@handmedown.com>
 * @license  MIT https://opensource.org/licenses/MIT
 * @link     https://github.com/hand-me-down/hand-me-down
 * @since    1.0.0
 */
class AccessTokenHandler implements AccessTokenHandlerInterface
{
    /**
     * Constructor for AccessTokenHandler.
     *
     * @param UserRepository $repository The user repository for database operations
     */
    public function __construct(
        private UserRepository $repository
    ) {
    }

    /**
     * Creates a UserBadge from the provided access token.
     *
     * @param string $accessToken The access token to validate
     *
     * @return UserBadge The user badge for the authenticated user
     *
     * @throws BadCredentialsException When the access token is invalid
     */
    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $user = $this->repository->findOneBy(["token" => $accessToken]);

        if (null === $user) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        return new UserBadge($user->getUserIdentifier());
    }
}

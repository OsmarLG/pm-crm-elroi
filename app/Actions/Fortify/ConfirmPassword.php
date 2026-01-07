<?php

namespace App\Actions\Fortify;

use Illuminate\Auth\Events\PasswordConfirmed;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
class ConfirmPassword
{
    /**
     * Confirm that the given password is valid for the user.
     *
     * @param  \Illuminate\Foundation\Auth\User  $user
     * @param  array<string, string>  $input
     */
    public function __invoke($user, array $input): void
    {
        Validator::make($input, [
            'password' => ['required', 'string'],
        ])->after(function ($validator) use ($user, $input) {
            if (! isset($input['password']) || ! Hash::check($input['password'], $user->password)) {
                $validator->errors()->add('password', __('The provided password was incorrect.'));
            }
        })->validate();
    }
}

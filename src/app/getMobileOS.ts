export function getMobileOS(
	navigator: Navigator,
	window: Window,
) {
	const userAgent = (
		navigator.userAgent
		|| navigator.vendor
		// @ts-expect-error `opera` is a non-standard prop
		|| window.opera
	);

	// Must come before Android check because its UA also contains 'Android'
	if (WINDOWS_PHONE_RGX.test(userAgent)) return 'Windows';

	if (ANDROID_RGX.test(userAgent)) return 'Android';

	if (
		IOS_RGX.test(userAgent)
		// @ts-expect-error MSStream is a non-standard prop
		&& !window.MSStream
	) return 'iOS';

	return '';
}

const WINDOWS_PHONE_RGX = /windows phone/i;
const ANDROID_RGX = /android/i;
const IOS_RGX = /iPad|iPhone|iPod/;

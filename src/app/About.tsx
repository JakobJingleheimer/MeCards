import pjson from '../../package.json' with { type: 'json' };


export default function About() {
	return (
		<main className="padding-m">
			<h1>About</h1>

			<p>Inspired by StoCard; RIP.</p>

			<p>This app is not monetised in any way, and there is no intention to ever do so.</p>

			<p>It’s (<a href={pjson.homepage}>open-source</a>), and works fully offline (except when fetching a merchant’s logo from <a href="https://commons.wikimedia.org/">WikiMedia</a>). All data you enter is stored locally on your device and never sent to third parties. The app is solely a client application—it has no server and nowhere to send any of your information.</p>

			<p>There’s currently no analytics or telemetry; if added in future, it will be a privacy-centric feature (for instance, automatically creating anoynomised bug reports in the project repo when an error is encountered).</p>

			<p>Version: <code>{pjson.version}</code></p>
		</main>
	);
}

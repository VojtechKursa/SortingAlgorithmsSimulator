import webpack from "webpack";
import webpackConfig from "../webpack.config";

const compiler = webpack(webpackConfig);

const watching = compiler.watch({}, (err, stats) => {
	const now = new Date();

	if (err != undefined) {
		console.error(`${now.toTimeString()} - Compilation failed.`);
		console.error(err);
	}
	else {
		console.log(`${now.toTimeString()} - Compilation successful.`);
		console.log(stats?.toString({ colors: true }));
	}
});

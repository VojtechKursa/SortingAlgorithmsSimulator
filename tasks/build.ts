import webpack from "webpack";
import webpackConfig from "../webpack.config";

const isProduction = process.argv.at(2) === "production";

const compiler = webpack({ ...webpackConfig, mode: isProduction ? "production" : "development" });

compiler.run((err, stats) => {
	if (err == undefined) {
		console.log("Compilation complete");
		console.log(stats?.toString({colors: true}));
	}
	else {
		console.error("Compilation failed");
		console.error(err);
	}

	compiler.close(() => {});
});

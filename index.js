import child_process from 'child_process';
import inlineSass from "inline-sass";
import { parse } from "node-html-parser";
import { minify } from "html-minifier";

const copyToClipboard = (data) => {
	const pbcopy = child_process.spawn('pbcopy');
	pbcopy.stdin.write(data);
	pbcopy.stdin.end();
}

let options = process.argv[3];
if (options) {
	options = JSON.parse(options);
}

inlineSass(process.argv[2], options)
	.then(result => {
		if (options.extractInnerHTMLSelector) {
			const dom = parse(String(result));
			result = dom.querySelector(options.extractInnerHTMLSelector).innerHTML;
		}
		if (options.minifyHTML) {
			result = minify(String(result), options.minifyHTML);	
		}
		copyToClipboard(String(result).trim());
		console.log('Styled HTML copied to clipboard');
	})
	.catch(console.error);
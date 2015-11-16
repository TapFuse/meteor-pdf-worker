var Future = Npm.require('fibers/future');
var fs = Npm.require('fs');
var writer = fs.createWriteStream('out.pdf');

createFile = function(html, options, callback) {
	wkhtmltopdf(html, options, function(err, signal) {
		if (err) {
			throw new Error(err.message);
		} else {
			callback && callback( null, fs.readFileSync('out.pdf'));
		}
	}).pipe(writer);
}

uploadFile = function (file, s3, callback) {
	s3.upload({
		Body: file
	},
	function(err, result) {
		if (err) {
			throw new Error(err.message);
		} else {
			callback && callback( null, result);
		}
	});
}

generatePDF = function(link, options, bucket, fileName, key) {
	var key = key ? key : '';
	var s3 = new AWS.S3({
		params: {
			Bucket: bucket,
			Key: key + fileName + '.pdf',
			ContentType: 'application/pdf'
		}
	});

	var wrappedCreateFile = Meteor.wrapAsync(createFile);
	var wrappedUploadFile = Meteor.wrapAsync(uploadFile);

	var file = wrappedCreateFile(link, options);
	if (file) {
		return wrappedUploadFile(file, s3);
	}
}

Meteor.methods({
	/**
	*	link - link used to generated pdf from
	*	options - options for generating pdf
	*	bucket - AWS bucket name
	*	fileName - how the file should be named in AWS
	* key - folder in the bucket
	* Example:
	* 	key + filename + '.pdf' = test/out.pdf
	*/
	'pdf-worker/createPDF': function(link, options, bucket, fileName, key) {
		return generatePDF(link, options, bucket, fileName, key);
	}
});
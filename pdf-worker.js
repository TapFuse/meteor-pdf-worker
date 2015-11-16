var Future = Npm.require('fibers/future');
var fs = Npm.require('fs');


createFile = function(writer, html, options, callback) {
	wkhtmltopdf(html, options, function(err, signal) {
		if (err) {
			console.log('createFile - ', err);
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
      console.log('uploadFile - ', err);
			// throw new Error(err.message);
		} else if (result) {
			callback && callback( null, result);
		}
	});
}

generatePDF = function(writer, link, options, bucket, fileName, key) {
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

	var file = wrappedCreateFile(writer, link, options);
	if (file) {
		return wrappedUploadFile(file, s3);
	}
  throw new Error('failed to generate');
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
    var writer = fs.createWriteStream( 'out.pdf');
		return generatePDF(writer, link, options, bucket, fileName, key);
	}
});

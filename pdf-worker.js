var Future = Npm.require('fibers/future');
var fs = Npm.require('fs');
var writer = fs.createWriteStream('out.pdf');

createFile = function(html, callback) {
	wkhtmltopdf(html, function(err, signal) {
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

generatePDF = function(link, bucket, fileName, key) {
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

	var file = wrappedCreateFile(link);
	if (file) {
		return wrappedUploadFile(file, s3);
	}
}

Meteor.methods({
	'pdf-worker/createPDF': function(link, bucket, fileName, key) {
		return generatePDF(link, bucket, fileName, key);
	}
});
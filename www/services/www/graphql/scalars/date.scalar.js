const { GraphQLScalarType, Kind } = require("graphql");

const DateTime = new GraphQLScalarType({
	name: "DateTime",
	description: "Date custom scalar type",
	serialize(value) {
		return value.getTime(); // Convert outgoing Date to integer for JSON
	},
	parseValue(value) {
		return new Date(value); // Convert incoming integer to Date
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			// Convert hard-coded AST string to integer and then to Date
			return new Date(parseInt(ast.value, 10));
		}
		// Invalid hard-coded value (not an integer)
		return null;
	},
});

module.exports = DateTime;

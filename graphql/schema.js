const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageURL: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post!]!
        totalItems: Int!
    }
    
    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageURL: String!
    }
    
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(postId: ID, postInput: PostInputData): Post!
        deletePost(postId: ID): Post
        updateStatus(status: String!): Boolean
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData
        postData(page: Int!): PostData!
        post(postId: ID!): Post!
        status: String
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }    
`)

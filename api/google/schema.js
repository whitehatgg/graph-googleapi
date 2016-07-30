import { property } from 'lodash';

export const schema = [`
# Uses exact field names from Google for simplicity
type Place {
  status: String!
  result: Result
}

type Result {
  formatted_address: String
  formatted_phone_number: String
  id: String
  name: String
  icon: String
}
`];

export const resolvers = {
  Place: {
    result: property('result')
  }
};

